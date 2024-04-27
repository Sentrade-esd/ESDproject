

data "google_service_account" "default" {
  account_id = "demodeployment"
}

# resource "google_compute_disk" "esd-disk" {
#   name  = "esd-disk"
#   type  = "local-ssd"
#   size  = 400
#   zone  = "us-central1-a"
# }

resource "google_container_cluster" "primary" {
  name     = "esd-cluster"
  location = var.region

  # Node pool configuration
  remove_default_node_pool = true
  initial_node_count       = 1

  # Add additional node pool configurations if needed
  deletion_protection = var.deletion_protection

  addons_config {
    gce_persistent_disk_csi_driver_config {
      enabled = true
    }
  }
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "esd-node-pool"
  cluster    = google_container_cluster.primary.id
  node_count = 2

  node_config {
    # machine_type = "e2-medium"
    machine_type = "c2-standard-4"

    # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
    service_account = data.google_service_account.default.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}

resource "null_resource" "deploy_app" {
  triggers = {
    always_run = "${timestamp()}"
  }

  provisioner "local-exec" {
    command = <<EOF
      gcloud container clusters get-credentials ${google_container_cluster.primary.name} --region ${var.region}
      for file in $(echo "${join(" ", var.files)}") ; do
        kubectl apply -f ./deployments/$file
      done
    EOF
  }

  depends_on = [
    google_container_cluster.primary,
    google_container_node_pool.primary_nodes
  ]
}



resource "google_clouddeploy_target" "github_target" {
  name = "github-target"
  description = "Target for deploying from GitHub repository"
  require_approval = false
  location = var.region

  gke {
    cluster = "projects/${var.project_id}/locations/${var.region}/clusters/${google_container_cluster.primary.id}"
  }
}

resource "google_clouddeploy_delivery_pipeline" "github_pipeline" {
  name        = "github-pipeline"
  description = "Pipeline for deploying from GitHub repository"
  location    = var.region

  

}



# resource "google_cloud_deploy_pipeline" "example_pipeline" {
#   name        = "example-pipeline"
#   description = "Pipeline for deploying Kubernetes configurations"
#   trigger     = google_cloud_deploy_trigger.example_trigger.id

#   for_each = { for idx, filename in var.files : idx => filename }

#   dynamic "steps" {
#     for_each = var.files

#     content {
#       name     = "apply-kubernetes-configs-${steps.key}"
#       action   = "apply-manifests"
#       manifest = file("path/to/${steps.value}")
#     }
#   }
# }
# branch_name = "drago/tanzuDemo"
# url = "https://github.com/nmywrld/ESDproject"

# resource "google_clouddeploy_delivery_pipeline" "github_pipeline" {
#   name = "github-pipeline"
#   description = "Pipeline for deploying from GitHub repository"
#   location = var.region

  # serialised_config = google_cloud_deploy_pipeline.example_pipeline.

  # serial_pipeline {
  #   stages {
  #     target_id = google_clouddeploy_target.github_target.id

  #   }
  # }
# }




data "external" "get_backend_service" {
  program = ["bash", "-c", "gcloud container clusters get-credentials ${google_container_cluster.primary.name} --region ${var.region} && kubectl get ing ingress-nginx-esd-project -n esd-project -o json | jq -r '.metadata.annotations[\"ingress.kubernetes.io/backends\"]' "]

  depends_on = [
    google_container_cluster.primary,
    google_container_node_pool.primary_nodes,
    null_resource.deploy_app
  ]
}

resource "null_resource" "enable_cdn" {
  provisioner "local-exec" {
    command = "gcloud compute backend-services update ${keys(data.external.get_backend_service.result)[0]} --enable-cdn --global --enable-logging --custom-request-header=ESD-Project:esd-project"
  }

  depends_on = [
    data.external.get_backend_service
  ]
}

