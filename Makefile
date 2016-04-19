build:
	docker build -t gaoyangyang/docker_visual .
run:
	docker run -t -i -d -p 8000:8000 --name docker_visual gaoyangyang/docker_visual
clean:
	docker  rm -f docker_visual
push:
	docker build -t localhost:5000/videosynopsis .
	docker push localhost:5000/videosynopsis
