.PHONY: all
all:
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

.PHONY: f
f:
	docker cp frontend/. frontend:/app/
