package api

type HttpResponse struct {
	OK           bool        `json:"ok"`
	Status       int         `json:"status"`
	Data         interface{} `json:"data,omitempty"`
	ErrorMessage string      `json:"error_message,omitempty"`
}
