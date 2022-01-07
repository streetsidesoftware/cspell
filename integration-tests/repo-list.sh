# output the list of repositories sorted
cat config/config.json | jq -r ".repositories | sort_by(.path) | .[].path  | select(startswith(\"streetside\") | not) | \"          - \" + ."
