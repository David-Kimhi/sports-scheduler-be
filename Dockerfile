# Base image with Node.js
FROM node:20

# Install rsync
RUN apt update && apt install -y rsync

# Set working directory
WORKDIR /root/sports-scheduler-be

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project files
COPY . .

# Build TypeScript files
RUN npm run build

# install dotenv and copy it
RUN npm install dotenv

ENV NODE_PATH=/root/sports-scheduler-be/node_modules


# Command to run the app
CMD ["sh", "-c", "NODE_PATH=$NODE_PATH node ./dist/fetch_with_flags.js"]
