# Makefile - common developer tasks

SHELL := /bin/bash

.PHONY: install deps build up down logs frontend-install backend-install test clean

install: deps

deps: frontend-install backend-install

frontend-install:
	cd frontend && npm install

backend-install:
	cd backend && npm install

build:
	docker-compose build

up:
	docker-compose up --build

down:
	docker-compose down

logs:
	docker-compose logs -f

test:
	# Run frontend tests
	cd frontend && npm test

clean:
	docker-compose down --volumes --remove-orphans
