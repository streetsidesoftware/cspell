# output the list of repositories sorted
cat config/config.json \
| jq ".repositories | sort_by(.path | ascii_downcase) | .[].path  | select(startswith(\"streetside\") | not)" \
| jq -s '.' > ../.github/integrations.json

# cspell:ignore downcase startswith streetside
