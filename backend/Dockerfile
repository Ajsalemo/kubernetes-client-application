FROM golang:1.23.5-alpine3.21

WORKDIR /app

# Download Go modules
COPY go.mod go.sum ./
RUN go mod download

COPY . ./

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o /usr/local/bin/app

EXPOSE 3070

# Run
CMD ["/usr/local/bin/app"]