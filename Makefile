include .env

ifeq ($(shell uname), Darwin)
    HOST_IP := $(shell ipconfig getifaddr en0)
else 
    HOST_IP := $(shell hostname -I | awk '{print $$1}')
endif

.PHONY: all
all: update_ip
	cd deploy && docker compose -f docker-compose.yml up -d --build

.PHONY: clean
clean:
	cd deploy && docker compose -f docker-compose.yml down

.PHONY: fclean
fclean: clean
	rm -rf ./deploy/pgdata
	docker system prune --all --force

.PHONY: re
re:	fclean all

update_ip:
	@if [ -f .env ]; then \
		if grep -q '^HOST_IP=' .env; then \
			sed -i~ 's/^HOST_IP=.*/HOST_IP=${HOST_IP}/' .env; \
		else \
			echo 'HOST_IP=${HOST_IP}' >> .env; \
		fi \
	else \
		echo '.env file not found'; \
	fi

.PHONY: f
f:
	docker exec frontend sh -c "rm -rf /app/src/*"
	docker cp frontend/src/. frontend:/app/src/
	docker exec frontend sh -c "npm run build"
