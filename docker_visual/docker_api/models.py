from django.db import models

class ResourceUsage(models.Model):

    service_name = models.CharField(max_length=100)
    cpu_percent = models.CharField(max_length=50)
    memory_limit = models.CharField(max_length=30)
    memory_usage = models.CharField(max_length=30)
    memory_percent = models.CharField(max_length=30)
    network_rx_bytes = models.CharField(max_length = 30)
    network_tx_bytes = models.CharField(max_length = 30)
    collect_time = models.CharField(max_length=100)
    def __unicode__(self):
        return self.service_name
    def __str__(self):
        return self.service_name
