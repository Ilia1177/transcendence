# Use official Node.js LTS
FROM node:18-alpine

# Install SQLite CLI and su-exec for user switching
RUN apk add --no-cache sqlite sqlite-dev bash su-exec

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy application code
COPY . .
COPY ./init.sql /tmp/

# Create /data directory
RUN mkdir -p /data

# Copy entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
# Set SQLite DB path as environment variable
ENV SQLITE_DB=/data/users.db

# Entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Default CMD: run Node.js app
CMD ["node", "index.js"]
