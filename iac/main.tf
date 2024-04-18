
data "google_service_account" "default" {
  account_id   = "demodeployment"
}


resource "google_container_cluster" "primary" {
  name     = "my-cluster"
  location = "asia-east1"  # Change to your desired region

  # Node pool configuration
  remove_default_node_pool = true
  initial_node_count       = 1

  # Add additional node pool configurations if needed
}

resource "google_container_node_pool" "primary_preemptible_nodes" {
  name       = "demo-node-pool"
  cluster    = google_container_cluster.primary.id
  node_count = 1

  node_config {
    preemptible  = true
    machine_type = "e2-medium"

    # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
    service_account = data.google_service_account.default.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}

