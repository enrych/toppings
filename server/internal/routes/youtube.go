package routes

import (
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/sosodev/duration"

	"github.com/enrych/toppings/server/internal/api"
)

const (
	PLAYLIST_BASE_ENDPOINT = "https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&fields=items/contentDetails/videoId,nextPageToken&key=%s&playlistId=%s&pageToken=%s"
	VIDEO_BASE_ENDPOINT    = "https://www.googleapis.com/youtube/v3/videos?&part=contentDetails&id=%s&key=%s&fields=items/contentDetails/duration"
)

type YouTubeData struct {
	NextPageToken string   `json:"nextPageToken"`
	Items         []Item   `json:"items"`
	PageInfo      PageInfo `json:"pageInfo"`
}

type Item struct {
	ContentDetails ContentDetails `json:"contentDetails"`
}

type PageInfo struct {
	TotalResults uint16 `json:"totalResults"`
}

type ContentDetails struct {
	Duration string `json:"duration"`
	VideoID  string `json:"videoId"`
}

type PlaylistResponseData struct {
	PlaylistID   string  `json:"playlist_id"`
	NumVideos    uint16  `json:"num_videos"`
	TotalRuntime float64 `json:"total_runtime"`
	AvgRuntime   float64 `json:"avg_runtime"`
}

func HandleYouTubePlaylist(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	var httpResponse api.HttpResponse

	API_KEY := os.Getenv("API_KEY")
	playlistID, exists := vars["playlistID"]
	if !exists {
		httpResponse = api.HttpResponse{
			OK:           false,
			Status:       http.StatusBadRequest,
			ErrorMessage: "Missing playlistID parameter",
		}
		jsonResponse(w, httpResponse)
		return
	}

	videoCount := 0
	var totalRuntime time.Duration

	nextPageToken := ""
	for {
		playlistEndpoint := fmt.Sprintf(PLAYLIST_BASE_ENDPOINT, API_KEY, playlistID, nextPageToken)
		playlistItemList, err := fetchYouTubeData(playlistEndpoint)
		if err != nil {
			httpResponse = api.HttpResponse{
				OK:           false,
				Status:       http.StatusInternalServerError,
				ErrorMessage: fmt.Sprintf("Error fetching playlist data: %s", err),
			}
			break
		}

		videoIDs := extractVideoIDs(playlistItemList)
		videoCount += len(videoIDs)

		videoEndpoint := fmt.Sprintf(VIDEO_BASE_ENDPOINT, strings.Join(videoIDs, ","), API_KEY)
		videoList, err := fetchYouTubeData(videoEndpoint)
		if err != nil {
			httpResponse = api.HttpResponse{
				OK:           false,
				Status:       http.StatusInternalServerError,
				ErrorMessage: fmt.Sprintf("Error fetching video data: %s", err),
			}
			break
		}

		for _, item := range videoList.Items {
			d, err := duration.Parse(item.ContentDetails.Duration)
			if err != nil {
				httpResponse = api.HttpResponse{
					OK:           false,
					Status:       http.StatusInternalServerError,
					ErrorMessage: fmt.Sprintf("Error parsing video duration: %s", err),
				}
				break
			}
			totalRuntime += d.ToTimeDuration()
		}

		if nextPageToken = playlistItemList.NextPageToken; nextPageToken == "" {
			if videoCount >= 500 {
				httpResponse = api.HttpResponse{
					OK:           false,
					Status:       http.StatusRequestEntityTooLarge,
					ErrorMessage: "Number of videos limited to 500.",
				}
			} else {
				httpResponse = api.HttpResponse{
					OK:     true,
					Status: http.StatusOK,
					Data: PlaylistResponseData{
						PlaylistID:   playlistID,
						NumVideos:    uint16(videoCount),
						TotalRuntime: totalRuntime.Seconds(),
						AvgRuntime:   math.Round(totalRuntime.Seconds() / float64(videoCount)),
					},
				}
			}
			break
		}
	}

	jsonResponse(w, httpResponse)
}

func fetchYouTubeData(endpoint string) (YouTubeData, error) {
	var data YouTubeData
	response, err := http.Get(endpoint)
	if err != nil {
		return data, err
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return data, fmt.Errorf("HTTP request failed with status code: %d", response.StatusCode)
	}

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return data, err
	}

	err = json.Unmarshal(body, &data)
	return data, err
}

func extractVideoIDs(playlistItemList YouTubeData) []string {
	var videoIDs []string
	for _, item := range playlistItemList.Items {
		videoIDs = append(videoIDs, item.ContentDetails.VideoID)
	}
	return videoIDs
}

func jsonResponse(w http.ResponseWriter, data api.HttpResponse) {
	jsonBytes, err := json.Marshal(data)
	if err != nil {
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonBytes)
}
