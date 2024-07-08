package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"

	"github.com/enrych/toppings/server/internal/routes"
)

func main() {
	if os.Getenv("API_KEY") == "" {
		err := godotenv.Load()
		if err != nil {
			log.Fatal("Error loading .env file")
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	API_KEY := os.Getenv("API_KEY")
	if API_KEY == "" {
		log.Fatal("API_KEY not set")
	}

	r := mux.NewRouter()
	c := cors.AllowAll()

	handler := c.Handler(r)

	y := r.PathPrefix("/youtube").Methods("GET").Subrouter()
	y.HandleFunc("/playlist/{playlistID}", routes.HandleYouTubePlaylist)

	log.Fatal(http.ListenAndServe(":"+port, handler))
}
