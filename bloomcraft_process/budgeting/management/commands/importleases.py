from django.core.management.base import BaseCommand, CommandError
import argparse
import json
from budgeting.models import *


class Command(BaseCommand):
    help = 'Imports a JSON file containing lease data'

    def add_arguments(self, parser):
        parser.add_argument('leasefile', type=argparse.FileType('r'))

    def handle(self, *args, **options):
        leases = json.load(options['leasefile'])

        for leaseParams in leases:
            rent = leaseParams[0]
            sqft = leaseParams[1]
            name = leaseParams[2]
            
            lease = Lease(rent=rent, original_rent=rent, sqft=sqft, name=name)
            self.stdout.write("Created Lease: " + str(lease))
            lease.save()
    
