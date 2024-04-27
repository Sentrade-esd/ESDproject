variable "deletion_protection" {
  default = false
}

variable "project_id" {
  default = "esd-project-420711"
}

variable "cluster_name" {
  default = "esd-cluster"
}

variable "region" {
  # default = "us-central1-a"
  default = "asia-southeast1-a"
}

variable "files" {
  # default = [
  #   "1kong.yaml",
  #   "2app.yaml",
  #   "3rabbit.yaml",
  #   "4sentimentApp.yaml",
  #   "5sentimentService.yaml",
  #   "6scraper.yaml",
  #   "7watchlist.yaml",
  #   "8notificationManager.yaml",
  #   "9telebot.yaml",
  #   "10userService.yaml",
  #   "11commentsService.yaml",
  #   "12transactionsService.yaml",
  #   "13followTrades.yaml"
  # ]
  default = [
    "00001config.yaml",
    "00002config.yaml",
    "00003config.yaml",
    "00004config.yaml",
    "00005config.yaml",
    "00006config.yaml",
    "00007config.yaml",
    "00008config.yaml",
    "00009config.yaml",
    "00010config.yaml",
    "00011config.yaml",
    "00012config.yaml",
    "00013config.yaml"
  ]
}