# Next.js Restaurant Review App

A simple single-page application built with Next.js allowing users to submit restaurant reviews. This project is containerized using Docker for easy setup.

## Features

*   Single-page interface for submitting restaurant reviews.
*   Displays the current application version (set via build process or environment variable).
*   Dockerized for a consistent runtime environment.

## Tech Stack

*   [Next.js](https://nextjs.org/) - React Framework
*   [React](https://reactjs.org/) - JavaScript Library
*   [Node.js](https://nodejs.org/) - JavaScript Runtime
*   [Docker](https://www.docker.com/) - Containerization

## Prerequisites

Before you begin, ensure you have the following installed on your system:

*   [Node.js](https://nodejs.org/en/download/) (Version 18.x or later recommended)
*   [npm](https://www.npmjs.com/get-npm), [yarn](https://yarnpkg.com/getting-started/install), or [pnpm](https://pnpm.io/installation) (Package Manager)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop) (or Docker Engine for Linux)

## Getting Started

There are two main ways to run this project:

**1. Running with Docker (Recommended)**

This method uses the container configuration.

1.  **Navigate to the project directory** in your terminal.

2.  **Ensure Docker is running.**

3.  **Build the Docker image:**
    *(Replace `my-nextjs-review-app` with your preferred image name)*
    ```bash
    docker build -t my-nextjs-review-app .
    ```

4.  **Run the container:**
    You need to map a port on your host machine to the port the application listens on inside the container (controlled by the `PORT` environment variable, typically 3000 if not overridden) and provide the necessary environment variables.

    ```bash
    docker run \
      -p 8080:3000 \
      -e PORT=3000 \
      -e NEXT_PUBLIC_APP_SERVICE_URL="http://localhost:5000" \
      --name nextjs-review-container \
      -d my-nextjs-review-app
    ```
    *   `-p 8080:3000`: Maps port 8080 on your host to port 3000 inside the container.
    *   `-e PORT=3000`: Tells the Next.js app *inside* the container to listen on port 3000.
    *   `-e NEXT_PUBLIC_APP_SERVICE_URL=...`: Sets the backend service URL. Adjust if your backend runs elsewhere.
    *   `-e NEXT_PUBLIC_APP_VERSION=...`: Sets the app version for display.
    *   `--name ...`: Assigns a name to the running container (optional).
    *   `-d`: Runs the container in detached mode (in the background).

5.  **Access the application:**
    Open your browser and navigate to `http://localhost:8080` (using the host port you specified in the `-p` flag).

6.  **To stop the container:**
    ```bash
    docker stop nextjs-review-container
    docker rm nextjs-review-container
    ```

**2. Running Natively (Without Docker)**

This method runs the Next.js development server directly on your host machine.

1.  **Navigate to the project directory** in your terminal.

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```

3.  **Set up environment variables:**
    Copy the template file to create your local environment configuration:
    ```bash
    cp .env.template .env.local
    ```
    Edit the `.env.local` file and set the required values:
    ```ini
    # .env.local
    NEXT_PUBLIC_APP_SERVICE_URL=http://localhost:5000 # Adjust if needed
    NEXT_PUBLIC_APP_VERSION=native-local-0.1 # Or your desired local version
    ```
    *Note: The `.env.local` file should be added to `.gitignore` and **not** committed to version control.*

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    # or
    # pnpm dev
    ```
    *(You can specify a different port using the `-p` flag: `npm run dev -- -p 4000`)*

5.  **Access the application:**
    Open your browser and navigate to `http://localhost:3000` (or the port specified if you used the `-p` flag).

## Environment Variables

This application requires the following environment variables:

| Variable                      | Description                                                                                                          | Where Used       | Exposed to Browser?  | How Set                                                              |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------------- | :--------------- | :------------------- | :------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_SERVICE_URL` | The base URL for the backend API service where reviews are submitted.                                                | Client           | Yes (`NEXT_PUBLIC_`) | Via `docker run -e` or set in `.env.local` for native development.   |
| `PORT`                        | The port the Next.js server listens on **inside the container** or when running `next start`. Ignored by `next dev`. | Server (Next.js) | No                   | Via `docker run -e`. For native dev, use `npm run dev -- -p <port>`. |

**Important:**

*   Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. **Do not put secrets in these variables.**
