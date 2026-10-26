.PHONY: up down test

up:
	docker compose up

down:
	docker compose down

test:
	docker compose run --rm dev bun run test:unit --run
