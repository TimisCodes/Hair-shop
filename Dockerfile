# Use official Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all project files
COPY . .

# Expose port your app runs on
EXPOSE 3000

# Start the app using PM2 or directly
CMD ["node", "server.js"]   # change server.js if your entry file is different
