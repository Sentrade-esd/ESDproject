terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = "5.25.0"
    }
  }
}


provider "google" {
  project = var.project_id
  region  = "us-central1-a"  # Change to your desired region
}

provider "kubernetes" {
  config_context_cluster = var.cluster_name
}

provider "kubernetes-alpha" {
  config_path = "~/.kube/config" # Update this with the path to your kubeconfig file
}