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
    cpu_utilize = models.CharField(max_length=50)
    mem_utilize = models.CharField(max_length=50)

    class Meta:
        abstract = True
        ordering = ['collect_time']
class OtherResourceUsage(CommonUsage):
    class Meta(CommonUsage.Meta):
        db_table = 'otherResourceUsage'
        def __unicode__(self):
            return self.service_name
        def __str__(self):
            return self.service_name
class ProxyStream1(CommonUsage):
    code_rate = models.CharField(max_length=50)
    resolution = models.CharField(max_length=50)
    class Meta(CommonUsage.Meta):
        db_table = 'proxyStream1'
    def __unicode__(self):
        return self.service_name
    def __str__(self):
        return self.service_name
class ProxyStream2(CommonUsage):
    code_rate = models.CharField(max_length=50)
    resolution = models.CharField(max_length=50)
    class Meta(CommonUsage.Meta):
        db_table = 'proxyStream2'
    def __unicode__(self):
        return self.service_name
    def __str__(self):
        return self.service_name
class ProxyStream3(CommonUsage):
    code_rate = models.CharField(max_length=50)
    resolution = models.CharField(max_length=50)
    class Meta(CommonUsage.Meta):
        db_table = 'proxyStream3'
    def __unicode__(self):
        return self.service_name
    def __str__(self):
        return self.service_name
class OnlineFormat1(CommonUsage):
    code_rate = models.CharField(max_length=50)
    resolution = models.CharField(max_length=50)
    class Meta(CommonUsage.Meta):
        db_table = 'onlineFormat1'
    def __unicode__(self):
        return self.service_name
    def __str__(self):
        return self.service_name
class OnlineFormat2(CommonUsage):
    code_rate = models.CharField(max_length=50)
    resolution = models.CharField(max_length=50)
    class Meta(CommonUsage.Meta):
        db_table = 'onlineFormat2'
    def __unicode__(self):
        return self.service_name
    def __str__(self):
        return self.service_name
class OnlineFormat3(CommonUsage):
    code_rate = models.CharField(max_length=50)
    resolution = models.CharField(max_length=50)
    class Meta(CommonUsage.Meta):
        db_table = 'onlineFormat3'
    def __unicode__(self):
        return self.service_name
    def __str__(self):
        return self.service_name
class CrossDetection1(CommonUsage):
    code_rate = models.CharField(max_length=50)
    resolution = models.CharField(max_length=50)
    class Meta(CommonUsage.Meta):
        db_table = 'crossDetection1'
    def __unicode__(self):
        return self.service_name
    def __str__(self):
        return self.service_name
class CrossDetection2(CommonUsage):
    code_rate = models.CharField(max_length=50)
    resolution = models.CharField(max_length=50)
    class Meta(CommonUsage.Meta):
        db_table = 'crossDetection2'
    def __unicode__(self):
        return self.service_name
    def __str__(self):
        return self.service_name
class CrossDetection3(CommonUsage):
    code_rate = models.CharField(max_length=50)
    resolution = models.CharField(max_length=50)
    class Meta(CommonUsage.Meta):
        db_table = 'crossDetection3'
    def __unicode__(self):
        return self.service_name
    def __str__(self):
        return self.service_name
