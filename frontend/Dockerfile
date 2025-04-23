# Use node 18-alpine for a smaller image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the necessary port
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "start"]
