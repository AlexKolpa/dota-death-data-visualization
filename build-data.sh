#!/bin/bash
timestamp() {
	date +"%s"
}

START=$(timestamp)

if [ ! -z $1 ] && [ $1 == clean ]; then
	[ -f master-zones.csv ] || (echo "Could not find 'master-zones.csv' file!" && exit 1)
	[ -d matches ] || mkdir matches
	[ "$(ls -A matches)" ] && rm matches/*
	echo "Extracting matches from 'master-zones.csv'"
	awk -F, 'NR>1{gsub(/"/,"",$11);print $2","$3","$5","$6","$7","$9","$12 > "matches/"$4"-"$11".csv" }' master-zones.csv
fi

[ ! -f output.csv ] || rm output.csv

echo "Setting up npm"
npm install --silent
MATCHES=matches/*
COUNT=`ls -1 matches | wc -l`
INDEX=0
for f in $MATCHES
do

	if ! ((INDEX % 10)); then
		echo -ne "parsed $INDEX of $COUNT matches\r"
	fi

	node index.js $f || break
	((INDEX++))
done
echo "parsed $COUNT of $COUNT matches"
END=$(timestamp)
echo "Done. Took $(( $END - $START )) seconds." 
#TODO start D3 with loads of pretties
