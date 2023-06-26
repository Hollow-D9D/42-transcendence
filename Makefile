include .env

.PHONY: all clean fclean re f help

CMP := deploy/docker-compose.yml

ifeq ($(shell uname), Darwin)
    HOST_IP := $(shell ipconfig getifaddr en0)
else 
    HOST_IP := $(shell hostname -I | awk '{print $$1}')
endif


all: update_ip create_dir
	@docker compose -f ${CMP} up -d
	@echo "\033[1;0mStarting service with host IP: \033[1;33m  http://${HOST_IP}:3000\033[1;0m"

build: update_ip
	@docker compose -f ${CMP} up -d --build
	@echo "\033[1;0mBuilding service with host IP: \033[1;33m  http://${HOST_IP}:3000\033[1;0m"

stop:
	@docker-compose -f ${CMP} stop

clean:
	@docker compose -f ${CMP} down

fclean: clean
	rm -rf ./deploy/pgdata
	docker system prune --all --force

re:	fclean all

create_dir:
	@if [ ! -d "deploy/pgdata" ]; then \
		mkdir deploy/pgdata; \
		chmod 755 deploy/pgdata; \
		echo "Directory 'pgdata' created."; \
	else \
		echo "\033[0;30m Directory 'pgdata' already exists.\033[1;0m"; \
	fi

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