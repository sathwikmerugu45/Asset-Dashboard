FROM node:18

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy backend source code
COPY backend/ ./

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]