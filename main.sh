#!/bin/bash

# SETTINGS
DOCKER_IMAGE="node:latest" # only used if you pass "docker" argument


if [ -z "$1" ]; then
    echo "USAGE: $0 {docker,native}" >&2
    exit 1
fi

runner="$1"

cd "$(dirname "$0")" || exit $?

user_id="$(id -u)"
group_id="$(id -g)"
this_dir="$(readlink -f "$(dirname "$0")")"

run_maybe_in_docker() {
    if [ "$runner" = 'native' ]; then
        "$@"
    else
        docker run -i -t -u "$user_id:$group_id" --rm -v "$this_dir/":/home/user:rw -w /home/user "$DOCKER_IMAGE" "$@"
    fi
}

if [ ! -f .initialized ]; then
    run_maybe_in_docker npm init -y || exit $?
    run_maybe_in_docker npm install babel-cli@6 babel-preset-react-app@3 || exit $?
    mkdir out || exit $?
    touch .initialized
fi

#run_maybe_in_docker npx babel --watch src --out-dir . --presets react-app/prod
run_maybe_in_docker npx babel src/demo.js --out-file demo_compiled.js --presets react-app/prod
