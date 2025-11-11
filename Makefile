OS := $(shell uname)

ifeq ($(OS), Linux)
	VOLUMES_PATH := $(shell pwd)/data
else
	VOLUMES_PATH := $(shell pwd)/volumes
endif

all : volumes build
	HOST_VOLUME_PATH=$(VOLUMES_PATH) docker compose -f srcs/docker-compose.yml up -d

volumes:
	@echo "Create volumes folder at $(VOLUMES_PATH)"
	@mkdir -p $(VOLUMES_PATH)/
	@chmod -R 777 $(VOLUMES_PATH)

colima:
	@echo "system is : $(OS)"
ifeq ($(OS), Darwin)
	#@mkdir -p $(VOLUMES_PATH)/
	colima start --mount $(VOLUMES_PATH):w --vm-type vz
endif

nginx:
	HOST_VOLUME_PATH=$(VOLUMES_PATH) docker compose -f srcs/docker-compose.yml up -d --build nginx-proxy
redis:
	HOST_VOLUME_PATH=$(VOLUMES_PATH) docker compose -f srcs/docker-compose.yml up -d --build redis-broker
api:
	HOST_VOLUME_PATH=$(VOLUMES_PATH) docker compose -f srcs/docker-compose.yml up -d --build api-gateway
user:
	HOST_VOLUME_PATH=$(VOLUMES_PATH) docker compose -f srcs/docker-compose.yml up -d --build user-management

build:
	HOST_VOLUME_PATH=$(VOLUMES_PATH) docker compose -f srcs/docker-compose.yml -f build

stop :
	docker compose -f srcs/docker-compose.yml stop 

down :
	docker compose -f srcs/docker-compose.yml down

re : fclean all

rebonus : fclean bonus

clean :
	@if [ -n "$$(docker ps -q)" ]; then docker stop $$(docker ps -q); else echo "No running containers to stop."; fi
	@if [ -n "$$(docker ps -aq)" ]; then docker rm -f $$(docker ps -aq); else echo "No running containers to remove."; fi
	@if [ -n "$$(docker images -q)" ]; then docker rmi -f $$(docker images -q); else echo "No images to remove."; fi
	@if [ -n "$$(docker volume ls -q)" ]; then docker volume rm $$(docker volume ls -q); else echo "No volumes to remove."; fi

fclean: clean
	docker system prune -a --volumes --force
	docker network prune
	rm -fr $(VOLUMES_PATH)
# ifeq ($(OS), Darwin)
# 	colima stop && colima delete
# endif
.PHONY : all clean fclean re
