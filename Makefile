up:
	docker-compose -f docker-compose.dev.yml up
down:
	docker-compose -f docker-compose.dev.yml down
login_backend:
	docker exec -it telegram-scheduler-bot_backend_1 bash
login_db:
	docker exec -it telegram-scheduler-bot_mongodb_1 mongo
rebuild_dev:
	docker-compose -f docker-compose.dev.yml build
