# Local LLM Chat Demo

This project is a Spring Boot application that provides a simple chat interface powered by a local LLM (Large Language Model) using [Ollama](https://ollama.com/). It uses the [llama3:8b](https://ollama.com/library/llama3:8b) model (ID: `365c0bd3c000`).

## Features

- Simple web chat interface ([test.html](src/main/resources/static/index.htm))
- REST API endpoint for chat interaction (`/chat`)
- Integration with Ollama running llama3:8b locally

## Prerequisites

- Java 24
- [Ollama](https://ollama.com/) installed and running locally
- llama3:8b model pulled in Ollama:
  ```sh
  ollama pull llama3:8b
  ```
- Maven

## Getting Started

1. **Clone the repository**
   ```sh
   git clone https://github.com/shramkoaleksey90/LocalLLM.git
   cd demo
   ```

2. **Start Ollama with llama3:8b**
   ```sh
   ollama run llama3:8b
   ```
   Ensure Ollama is running at `http://localhost:11434`.

3. **Build and run the Spring Boot application**
   ```sh
   mvn spring-boot:run
   ```

4. **Open the chat UI**
    - Visit [http://localhost:8080/test.html](http://localhost:8080/test.html) in your browser.

## Configuration

- Ollama connection and model settings are in [`application.yml`](src/main/resources/application.yml).
- The chat endpoint is implemented in [`MinimalChatController`](src/main/java/com/example/local_llm/controller/MinimalChatController.java).

## Model Information

- **Model:** [llama3:8b](https://ollama.com/library/llama3:8b)
- **Model ID:** `365c0bd3c000`
- **License:** [Meta Llama 3 Community License](https://www.llama.com/llama3/license/)

## License

This project is for demonstration purposes.