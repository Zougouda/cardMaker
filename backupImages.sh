#!/bin/bash

folderToSave="public/images/savedCards/"
backupFolder="/mnt/nas/backup/images/cardMaker/savedCards/"

mkdir -p $backupFolder

rsync -r $folderToSave $backupFolder
