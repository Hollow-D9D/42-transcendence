# Use an official Node.js runtime as the base image
FROM node:lts-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock to the container
COPY package.json yarn.lock ./

# Install project dependencies
RUN yarn install --production

# Copy the rest of the application code to the container
COPY . .

# Build the application
RUN yarn run build

# Install serve globally (if you need to serve the built static files)
RUN yarn global add serve

# Expose the desired port (assuming the application listens on port 3000)
EXPOSE 3000

# Define the command to run the application
CMD ["serve", "-s", "build", "-l", "3000"]
