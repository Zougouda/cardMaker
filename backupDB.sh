#!/bin/bash

#mongodump --db zougoubot --out backup/db/

backupFolder="/mnt/nas/backup/mongo/"

mkdir -p $backupFolder
mongodump --db cardMaker --out $backupFolder
