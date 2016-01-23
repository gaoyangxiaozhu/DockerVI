from django.db import models

class CommonUsage(models.Model):
    service_name = models.CharField(max_length=100)
    cpu_percent = models.CharField(max_length=50)
    memory_limit = models.CharField(max_length=30)
    memory_usage = models.CharField(max_length=30)
    memory_percent = models.CharField(max_length=30)
    network_rx_bytes = models.CharField(max_length = 30)
    network_tx_bytes = models.CharField(max_length = 30)
    collect_time = models.CharField(max_length=100)
    cpu = models.CharField(max_length=50)
    memory = models.CharField(max_length=50)

    class Meta:
        abstract = True
        ordering = ['collect_time']

class ProxyStream1(CommonUsage):
    code_rate = models.CharField(max_length=50)
    resolution = models.CharField(max_length=50)
    def __unicode__(self):
        return self.service_name
    def __str__(self):
        return self.service_name
class ProxyStream2(CommonUsage):
    code_rate = models.CharField(max_length=50)
    resolution = models.CharField(max_length=50)
    def __unicode__(self):
        return self.service_name
    def __str__(self):
        return self.service_name
