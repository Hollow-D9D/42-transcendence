include .env

.PHONY: all clean fclean re f help

ifeq ($(shell uname), Darwin)
    HOST_IP := $(shell ipconfig getifaddr en0)
else 
    HOST_IP := $(shell hostname -I | awk '{print $$1}')
endif


all: update_ip
	@cd deploy && docker compose -f docker-compose.yml up -d
	@echo "\033[1;0mStarting service with host IP: \033[1;33m  http://${HOST_IP}:3000\033[1;0m"

build: update_ip
	cd deploy && docker compose -f docker-compose.yml up -d --build
	@echo "\033[1;0mBuilding service with host IP: \033[1;33m  http://${HOST_IP}:3000\033[1;0m"

stop:
	cd deploy && docker-compose stop

clean:
	cd deploy && docker compose -f docker-compose.yml down

fclean: clean
	rm -rf ./deploy/pgdata
	docker system prune --all --force

re:	fclean all

update_ip:
	@if [ -f deploy/.env ]; then \
		if grep -q '^HOST_IP=' deploy/.env; then \
			sed -i~ 's/^HOST_IP=.*/HOST_IP=${HOST_IP}/' deploy/.env; \
		else \
			echo 'HOST_IP=${HOST_IP}' >> deploy/.env; \
		fi \
	else \
		echo 'deploy/.env file not found'; \
	fi
	@rm deploy/.env~

f:
	docker exec frontend sh -c "rm -rf /app/src/*"
	docker cp frontend/src/. frontend:/app/src/
	docker exec frontend sh -c "npm run build"

help:
	@echo "Available targets:"
	@echo "  all       : Start the service"
	@echo "  build     : Build the service"
	@echo "  stop      : Stop the service"
	@echo "  clean     : Clean up the service"
	@echo "  fclean    : Remove all service-related resources"
	@echo "  re        : Clean and rebuild the service"
	@echo "  update_ip : Update the HOST_IP in .env file"