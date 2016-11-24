#!/bin/bash

CWD="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Show the help text
function show_help() {
  echo ""
  echo "Usage: sh build.sh <command> [<args>]"
  echo ""
  echo "Meteor build command list:"
  echo "  --help|-h                  Shows this help text."
  echo "  --build                    Builds the Meteor bundle only."
  echo "  --build-deploy-staging     Commits and pushes changes the to repository before"
  echo "                             deploying to the 'staging' AWS OpsWorks stack."
  echo "  --build-deploy-production  Commits and pushes changes the to repository before"
  echo "                             deploying to the 'production' AWS OpsWorks stack."
  echo "  --deploy-staging           Deploys to the 'staging' server."
  echo "  --deploy-production        Deploys to the 'production' server."
  echo ""
  exit 1
}


# Builds the Meteor bundle
function build_meteor_bundle() {

  # Remove old bundle
  rm -Rf cd ${CWD}/bundle/

  # Bundle up the Meteor project
  cd ${CWD}/src/
  meteor build ../ --directory --architecture=os.linux.x86_64

  # Return back to current working directory root before continuing
  cd ${CWD}

  # Deploy only if a variable has been passed
  if [ -n "$1" ]; then
    aws_deploy $1
  fi
}


# AWS OpsWorks Deploy script
# Commits
function aws_deploy() {
  local AWS_REGION="us-east-1"
  local AWS_STACK_ID=""
  local AWS_APP_ID=""
  local AWS_CMD="{\"Name\": \"deploy\"}"
  local GIT_BRANCH=$(git branch 2>/dev/null| sed -n '/^\*/s/^\* //p')

  # Check that the argument is "staging" or "production"
  if [ "$1" == "staging" ] || [ "$1" == "production" ]; then

    # Deploy to staging
    if [ "$1" == "staging" ]; then

      # If we are not on the staging branch then warn the user and exit
      if [ "${GIT_BRANCH}" != "staging" ]; then
        echo "Please commit your changes and merge them into the \"staging\" branch"
        echo "before trying to deploy again."
        exit 1
      fi

      git add -A
      git commit -m "Created Meteor build bundle for deploying on the AWS OpsWorks 'staging' stack."
      git push origin staging

      AWS_STACK_ID=""
      AWS_APP_ID=""
    fi


    # Deploy to production
    if [ "$1" == "production" ]; then

      # If we are not on the production branch then warn the user and exit
      if [ "${GIT_BRANCH}" != "master" ]; then
        echo "Please commit your changes and merge them into the \"master\" branch"
        echo "before trying to deploy again."
        exit 1
      fi

      git add -A
      git commit -m "Created Meteor build bundle for deploying on the AWS OpsWorks 'master' stack."
      git push origin master

      AWS_STACK_ID="4b9fc002-f3e2-4e2d-8ca5-b5f70ca9b63b"
      AWS_APP_ID="66c857fe-4b18-478f-a69b-0cd886a9c373"
    fi


    # Deploy - eu-west-1 (Ireland)
    aws opsworks --region "${AWS_REGION}" create-deployment \
    --stack-id "${AWS_STACK_ID}" \
    --app-id "${AWS_APP_ID}" \
    --command "${AWS_CMD}"
  fi
}

# Show the help text if no parameters have been given
if test $# -eq 0; then
  show_help
else

  # Flags and their functionalities
  while test $# -gt 0; do
    case "$1" in
      --help|-h)
        show_help
        ;;
      --build)
        build_meteor_bundle
        shift
        ;;
      --build-deploy-staging)
        build_meteor_bundle "staging"
        shift
        ;;
      --build-deploy-production)
        build_meteor_bundle "production"
        shift
        ;;
      --deploy-staging)
        aws_deploy "staging"
        shift
        ;;
      --deploy-production)
        aws_deploy "production"
        shift
        ;;
      *)
        if test $# -gt 0; then
          show_help
        fi
        break
        ;;
    esac
  done
fi
