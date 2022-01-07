# output the list of repositories sorted
cat config/config.json | jq -r ".repositories | sort_by(.path | ascii_downcase) | .[].path  | select(startswith(\"streetside\") | not) | \"          - \" + ."

# cspell:ignore downcase startswith streetside
