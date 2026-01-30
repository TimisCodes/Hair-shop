FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source
COPY . .

# Create uploads folder if missing
RUN mkdir -p public/uploads

# Expose app port
EXPOSE 3000

# Start app
CMD ["node", "server.js"]
