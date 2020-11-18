# CodeChallenge_1
Code Challenge backend nodejs 11/2020
## Usage

>To run api
Please change docker-compose.yml 

From ...
```sh
 node:
      container_name: node_server

      build:
         context: .
         dockerfile: ./docker/Dockerfile
      ports:
         - 3000:3000
      volumes:
         - .:/app
      command: npm run test
      environment:
         - REDIS_HOST=redis
         - NODE_ENV=test
      depends_on:
         - redis
         - mongo
      networks:
         - common
      links:
         - mongo

```
To ...
```sh
 node:
      container_name: node_server

      build:
         context: .
         dockerfile: ./docker/Dockerfile
      ports:
         - 3000:3000
      volumes:
         - .:/app
      command: npm start
      environment:
         - REDIS_HOST=redis
         - NODE_ENV=production
      depends_on:
         - redis
         - mongo
      networks:
         - common
      links:
         - mongo

```

>To run Unit test
just change position "From" "to"  above
## Contact 
[Tri Bui Quang](https://github.com/TriBuiQuang)
