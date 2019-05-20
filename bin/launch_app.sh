#!/bin/bash
echo "starting mongoDB server..."
sudo service mongod start
echo "mongoDB started successfully"
echo "launching nodejs app..."
node ../server.js
