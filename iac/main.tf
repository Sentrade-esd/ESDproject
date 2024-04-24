
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


# resource "google_compute_backend_service" "cdn_backend_service" {
#   name    = "cdn-esd-cluster"
#   project = var.project_id
#   backend {
#     group = google_container_node_pool.primary_nodes.instance_group_urls[0]
#   }
#   enable_cdn = true
# }

# data "google_container_cluster" "primary" {
#   name     = google_container_cluster.primary.name
#   location = google_container_cluster.primary.location
# }


# data "google_compute_instance_group" "primary" {
#   self_link = tolist(data.google_container_cluster.primary.node_pool[0].instance_group_urls)[0]
# }

# resource "google_compute_backend_service" "cdn_backend_service" {
#   name    = "cdn-esd-cluster"
#   project = var.project_id
#   backend {
#     group = data.google_compute_instance_group.primary.self_link
#   }
#   enable_cdn = true
# }




# Get the backend service name from the created Ingress resource
# data "kubernetes_ingress" "app_ingress" {
#   metadata {
#     name      = "ingress-nginx"
#     namespace = "esd-project"
#   }

#   depends_on = [ 
#     google_container_cluster.primary, 
#     google_container_node_pool.primary_nodes,
#     null_resource.deploy_app
#   ]
# }
# data "kubernetes_service" "nginx_service" {
#   metadata {
#     name      = "ingress-nginx"
#     namespace = "esd-project"
#   }

#   depends_on = [ 
#     google_container_cluster.primary, 
#     google_container_node_pool.primary_nodes,
#     null_resource.deploy_app
#   ]
# }

# output "name" {
#   value = data.kubernetes_service.nginx_service
# }


# data "external" "get_backend_service" {
#   program = ["bash", "-c", "gcloud container clusters get-credentials ${google_container_cluster.primary.name} --region ${var.region} && kubectl get ing app-ingress -n esd-project -o json | jq -r '.metadata.annotations[\"ingress.kubernetes.io/backends\"]' "]

#   depends_on = [ 
#     google_container_cluster.primary, 
#     google_container_node_pool.primary_nodes,
#     null_resource.deploy_app
#   ]
# }

# ------------------
# data "google_compute_instance_group" "primary" {
#   name = google_container_node_pool.primary_nodes.name
#   zone = "asia-southeast1-a"
# }

# resource "google_compute_health_check" "default" {
#   name               = "default-health-check"
#   check_interval_sec = 5
#   timeout_sec        = 5
#   http_health_check {
#     port = 80
#   }
# }

# resource "google_compute_backend_service" "cdn_backend_service" {
#   name    = "cdn-esd-cluster"
#   project = var.project_id
#   backend {
#     group = data.google_compute_instance_group.primary.self_link
#     balancing_mode = "UTILIZATION"
#   }

#   enable_cdn = true
#   health_checks = [google_compute_health_check.default.self_link]
# }

# resource "google_compute_url_map" "url_map" {
#   name            = "url-map"
#   default_service = google_compute_backend_service.cdn_backend_service.self_link
# }

# resource "google_compute_target_http_proxy" "http_proxy" {
#   name   = "http-proxy"
#   url_map = google_compute_url_map.url_map.self_link
# }

# resource "google_compute_global_address" "global_address" {
#   name = "global-address"
# }

# resource "google_compute_global_forwarding_rule" "global_forwarding_rule" {
#   name       = "global-forwarding-rule"
#   target     = google_compute_target_http_proxy.http_proxy.self_link
#   port_range = "80"
#   ip_address = google_compute_global_address.global_address.address
# }

# ------------------

# resource "google_compute_health_check" "default" {
#   name               = "default-health-check"
#   check_interval_sec = 5
#   timeout_sec        = 5
#   http_health_check {
#     port = 80
#   }
# }

# resource "google_compute_region_network_endpoint_group" "neg" {
#   name                  = "esd-neg"
#   # network_endpoint_type = "INTERNET_IP_PORT"
#   region                = replace(var.region, "-a", "")
#   cloud_run {
#     service = "ingress-nginx"
#   }
# }

# resource "google_compute_backend_service" "cdn_backend_service" {
#   name    = "cdn-esd-cluster"
#   project = var.project_id
#   backend {
#     group = google_compute_region_network_endpoint_group.neg.self_link
#     balancing_mode = "UTILIZATION"
#   }

#   enable_cdn = true
#   depends_on = [ data.external.get_backend_service ]
# }

# resource "google_compute_url_map" "url_map" {
#   name            = "url-map"
#   default_service = google_compute_backend_service.cdn_backend_service.self_link
# }

# resource "google_compute_target_http_proxy" "http_proxy" {
#   name   = "http-proxy"
#   url_map = google_compute_url_map.url_map.self_link
# }

# resource "google_compute_global_address" "global_address" {
#   name = "global-address"
# }

# resource "google_compute_global_forwarding_rule" "global_forwarding_rule" {
#   name       = "global-forwarding-rule"
#   target     = google_compute_target_http_proxy.http_proxy.self_link
#   port_range = "80"
#   ip_address = google_compute_global_address.global_address.address
# }
# ------------------
data "external" "get_backend_service" {
  program = ["bash", "-c", "gcloud container clusters get-credentials ${google_container_cluster.primary.name} --region ${var.region} && kubectl get ing ingress-nginx-esd-project -n esd-project -o json | jq -r '.metadata.annotations[\"ingress.kubernetes.io/backends\"]' "]

  depends_on = [ 
    google_container_cluster.primary, 
    google_container_node_pool.primary_nodes,
    null_resource.deploy_app
  ]
}



resource "google_compute_health_check" "default" {
  name               = "default-health-check"
  check_interval_sec = 5
  timeout_sec        = 5
  http_health_check {
    port = 80
  }
}

resource "google_compute_backend_service" "cdn_backend_service" {
  name    = "cdn-esd-cluster"
  project = var.project_id
  backend {
    group = "https://www.googleapis.com/compute/v1/projects/${var.project_id}/zones/${var.region}/networkEndpointGroups/${keys(data.external.get_backend_service.result)[0]}"
    balancing_mode = "RATE"
    max_rate_per_endpoint = 100 # Adjust this value as needed
  }
  backend {
    group = "https://www.googleapis.com/compute/v1/projects/${var.project_id}/zones/${var.region}/networkEndpointGroups/${keys(data.external.get_backend_service.result)[1]}"
    balancing_mode = "RATE"
    max_rate_per_endpoint = 100 # Adjust this value as needed
  }
  health_checks = [google_compute_health_check.default.self_link]
  enable_cdn = true
  depends_on = [ data.external.get_backend_service ]
}

# resource "google_compute_url_map" "url_map" {
#   name            = "url-map"
#   default_service = google_compute_backend_service.cdn_backend_service.self_link
# }

# resource "google_compute_target_http_proxy" "http_proxy" {
#   name   = "http-proxy"
#   url_map = google_compute_url_map.url_map.self_link
# }

# resource "google_compute_global_forwarding_rule" "global_forwarding_rule" {
#   name       = "global-forwarding-rule"
#   target     = google_compute_target_http_proxy.http_proxy.self_link
#   port_range = "80"
#   ip_address = google_compute_global_address.global_address.address
# }
