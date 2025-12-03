from django.db import models

class Location(models.Model):
    id = models.PositiveIntegerField(primary_key=True)
    latitude = models.DecimalField(max_digits=12, decimal_places=6,null=True)
    longitude = models.DecimalField(max_digits=12, decimal_places=6,null=True)
    dist_to_origin = models.DecimalField(max_digits=12, decimal_places=6,null=True)
    name = models.CharField(max_length=255, null=True)
    address = models.TextField(null=True)
    provinsi = models.CharField(max_length=255, null=True)
    kabupaten_kota = models.CharField(max_length=255, null=True)
    kecamatan = models.CharField(max_length=255,  null=True)
    desa_kelurahan = models.CharField(max_length=255, null=True)
    kode_pos = models.PositiveIntegerField(null=True)
    is_dc = models.BooleanField(null=True)
    open_hour = models.TimeField(null=True)
    close_hour = models.TimeField(null=True)
    dc_id = models.PositiveIntegerField(null=True)
    customer_id = models.PositiveIntegerField(null=True)

    def __str__(self):
        return self.address
    
    def get_latitude_longitude(self):
        return self.latitude, self.longitude

class Truck(models.Model):  
    id= models.PositiveIntegerField(primary_key=True)
    plate_number=  models.TextField(null=True)
    type_id= models.PositiveIntegerField(null=True)
    dc_id= models.PositiveIntegerField(null=True)
    type_name = models.TextField( null= True)
    cluster_order = models.PositiveIntegerField(null=True)
    max_individual_capacity_volume = models.DecimalField(max_digits=10, decimal_places=2,null=True)
    current_volume = models.DecimalField(max_digits=10, decimal_places=2,null=True)

    def __str__(self):
        return self.plate_number
    
    def get_id(self):
        return self.id
    
    def get_max_capacity(self):
        return self.max_individual_capacity_volume 
    
    def get_avaiable_capacity(self):
        return self.max_individual_capacity_volume - self.current_volume
    
    def get_current_capacity(self):
        return self.current_volume
    
    def add_new_order(self, delivery_order_capacity):
       self.current_volume = self.current_volume + delivery_order_capacity

    def get_cluster_order(self):
        return self.cluster_order
    
    def set_cluster_order(self, cluster):
        self.cluster_order = cluster
        
    def drop_order(self, delivery_order_capacity):
       self.current_volume = self.current_volume - delivery_order_capacity
          

class DeliveryOrder(models.Model):
    delivery_order_num = models.TextField(primary_key=True)
     
    loc_dest = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='destination_orders',null=True)
    loc_ori = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='origin_orders',null=True)
     
    truck_id = models.PositiveIntegerField(null=True)
    shipment_id =  models.PositiveIntegerField(null=True)
    weight = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    volume = models.DecimalField(max_digits=10, decimal_places=2,null=True)
    quantity = models.PositiveIntegerField(null=True)
    status = models.CharField(max_length=255, null=True)
    eta = models.DateTimeField(null=True)
    etd = models.DateTimeField(null=True)
    atd = models.DateTimeField(null=True)
    ata = models.DateTimeField(null=True)
    cluster = models.PositiveIntegerField(null=True)

    def __str__(self):
        return self.order_num
    
    def set_truck_id(self, truck_id):
        self.truck_id = truck_id


class Shipment(models.Model):
    """
    Minimal projection of the legacy Shipment table so we can update
    routing and emission metrics without redefining the whole schema.
    """

    id = models.PositiveIntegerField(primary_key=True)
    total_distance_m = models.BigIntegerField(null=True, blank=True)
    total_travel_time_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    total_travel_time_with_waiting_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    total_co2_emission_g = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    routing_priority = models.CharField(max_length=16, null=True, blank=True)
    routing_run_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'shipment'
        managed = False