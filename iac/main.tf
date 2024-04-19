
data "google_service_account" "default" {
  account_id   = "demodeployment"
}

# resource "google_compute_disk" "esd-disk" {
#   name  = "esd-disk"
#   type  = "local-ssd"
#   size  = 400
#   zone  = "us-central1-a"
# }

resource "google_container_cluster" "primary" {
  name     = "esd-cluster"
  location = "us-central1-a"  # Change to your desired region

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
  node_count = 1

  node_config {
    machine_type = "e2-medium"

    # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
    service_account = data.google_service_account.default.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}

resource "null_resource" "deploy_app" {
  provisioner "local-exec" {
    command = <<EOF
      gcloud container clusters get-credentials ${google_container_cluster.primary.name} --region ${var.region}
      for file in ./deployments/*.yaml; do
        kubectl apply -f $file
      done
    EOF
  }
  depends_on = [
    google_container_cluster.primary,
    google_container_node_pool.primary_nodes
  ]
}

# resource "null_resource" "get_access_token" {
#   provisioner "local-exec" {
#     command = "gcloud auth print-access-token $(gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS) > access_token.txt"
#   }
# }

# data "local_file" "access_token" {
#   depends_on = [null_resource.get_access_token]
#   filename = "${path.module}/access_token.txt"
# }

# resource "local_file" "kubeconfig" {
#   content = <<EOF
#   apiVersion: v1
#   clusters:
#   - cluster:
#       certificate-authority-data: ${google_container_cluster.primary.master_auth.0.cluster_ca_certificate}
#       server: https://${google_container_cluster.primary.endpoint}
#     name: cluster
#   contexts:
#   - context:
#       cluster: cluster
#       user: user
#     name: context
#   current-context: context
#   kind: Config
#   preferences: {}
#   users:
#   - name: user
#     user:
#       auth-provider:
#         config:
#           cmd-args: config config-helper --format=json
#           cmd-path: gcloud
#           expiry-key: '{.credential.token_expiry}'
#           token-key: '{.credential.access_token}'
#         name: gcp
#   EOF
#   filename = "${path.module}/kubeconfig.yaml"
# }

