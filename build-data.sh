[ -d matches ] || mkdir matches
[ -f master-zones.csv ] || (echo "Could not find 'master-zones.csv' file!" && exit 1)
rm matches/*
echo "Extracting matches from 'master-zones.csv'"
awk -F, 'NR>1{gsub(/"/,"",$11);print $2", "$3", "$5", "$6", "$7", "$9", "$12 > "matches/"$4"-"$11".csv" }' master-zones.csv
npm install
node index.js
#TODO start D3 with loads of pretties
