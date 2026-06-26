VERSION ?= 0.2.0
BIN     := gitsols-noc-agent
LDFLAGS := -s -w -X main.version=$(VERSION)

.PHONY: build build-all install package test fmt clean

build:
	go build -trimpath -ldflags "$(LDFLAGS)" -o bin/$(BIN) ./cmd/$(BIN)

build-all:
	GOOS=linux   GOARCH=amd64 go build -trimpath -ldflags "$(LDFLAGS)" -o bin/$(BIN)-linux-amd64    ./cmd/$(BIN)
	GOOS=linux   GOARCH=arm64 go build -trimpath -ldflags "$(LDFLAGS)" -o bin/$(BIN)-linux-arm64    ./cmd/$(BIN)
	GOOS=darwin  GOARCH=amd64 go build -trimpath -ldflags "$(LDFLAGS)" -o bin/$(BIN)-darwin-amd64   ./cmd/$(BIN)
	GOOS=darwin  GOARCH=arm64 go build -trimpath -ldflags "$(LDFLAGS)" -o bin/$(BIN)-darwin-arm64   ./cmd/$(BIN)
	GOOS=windows GOARCH=amd64 go build -trimpath -ldflags "$(LDFLAGS)" -o bin/$(BIN)-windows-amd64.exe ./cmd/$(BIN)

install: build
	install -m 0755 bin/$(BIN) /usr/local/bin/$(BIN)

test:
	go test -race ./...

fmt:
	gofmt -w .

clean:
	rm -rf bin

# Signed installers happen in CI. See .github/workflows/agent.yml (Phase 2).
package:
	@echo "Run in CI — requires code-signing certs (EV)."
	@false
