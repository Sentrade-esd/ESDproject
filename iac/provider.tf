terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = "5.25.0"
    }
  }

  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "sentrade_esd"

    workspaces {
      name = "ESDproject"
    }
  }
}


provider "google" {
  project = var.project_id
  region  = var.region
  credentials = var.gcp_sa_key != "" ? var.gcp_sa_key : null
}


variable "gcp_sa_key" {
  description = "GCP Service Account Key in JSON format"
  type        = string
  default = ""
}

data "google_client_config" "default" {}

provider "kubernetes" {
  host  = "https://${google_container_cluster.primary.endpoint}"
  token = data.google_client_config.default.access_token

  client_certificate     = base64decode(google_container_cluster.primary.master_auth[0].client_certificate)
  client_key             = base64decode(google_container_cluster.primary.master_auth[0].client_key)
  cluster_ca_certificate = base64decode(google_container_cluster.primary.master_auth[0].cluster_ca_certificate)
}

# provider "kubernetes-alpha" {
#   config_path = "~/.kube/config" # Update this with the path to your kubeconfig file
# }