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

# Command to run the app
CMD ["npm", "start"]
