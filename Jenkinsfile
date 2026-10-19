pipeline {
  agent {
    node { label "docker-host" }
  }

  environment {
    GIT_NAME = "datahub"
    registry = "eeacms/eea-datahub"
    default_branch = "main"
   }

  stages {

    stage ('Docker build and push') {
      when {
        environment name: 'CHANGE_ID', value: ''
      }

      steps {
        script {
            // Lowercase the branch name and replace slashes with dashes for Docker tag compliance
            def safeBranch = env.BRANCH_NAME.toLowerCase().replaceAll('/', '-')
            def tagName
            if (env.BRANCH_NAME == env.default_branch) {
                tagName = "${GIT_COMMIT.take(8)}"
            } else {
                tagName = "${safeBranch}-${GIT_COMMIT.take(8)}"
            }
            try {
                // GitHub PAT (classic) with read:packages, used by .npmrc to install the @geocat packages.
                // Passed as a BuildKit secret read from the environment, so the token never ends up
                // in the command line, the build log or the image.
                withCredentials([string(credentialsId: 'eea-datahub-github-packages-token', variable: 'GITHUB_PACKAGES_AUTH_TOKEN')]) {
                    dockerImage = docker.build("$registry:$tagName", "--pull --no-cache --secret id=npm_token,env=GITHUB_PACKAGES_AUTH_TOKEN .")
                }
                docker.withRegistry( '', 'eeajenkins' ) {
                    dockerImage.push()
                }
            }
            finally {
                sh "docker rmi $registry:$tagName"
            }
        }
      }
    }

  }

  post {
      always {
        cleanWs(cleanWhenAborted: true, cleanWhenFailure: true, cleanWhenNotBuilt: true, cleanWhenSuccess: true, cleanWhenUnstable: true, deleteDirs: true)
        script {
          def url = "${env.BUILD_URL}/display/redirect"
          def status = currentBuild.currentResult
          def subject = "${status}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'"
          def summary = "${subject} (${url})"
          def details = """<h1>${env.JOB_NAME} - Build #${env.BUILD_NUMBER} - ${status}</h1>
                           <p>Check console output at <a href="${url}">${env.JOB_BASE_NAME} - #${env.BUILD_NUMBER}</a></p>
                        """
          emailext (subject: summary, body: details, attachLog: true, compressLog: true, to: 'juanluisrp@geocat.net')
        }
      }
    }
}
