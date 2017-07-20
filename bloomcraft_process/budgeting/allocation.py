from collections import defaultdict
from math import ceil
import pprint
from django.utils.dateformat import format
from django.conf import settings

flatten = lambda l: [item for sublist in l for item in sublist]
epsilon = 1e-5

class RankedAllocator:
    def __init__(self):
        pass
    
    def get_allowed_additional_allocation(self, vote, expenses, working_allocation, working_user_allocation):
        expense = vote.expense
        user = vote.user

        allowed_global_allocation = self.total_amount
        allowed_personal_allocation = self.total_amount #(global, personal)

        if not expense.excess_allowed:
            allowed_global_allocation = min(allowed_global_allocation, expense.requested_funds - (expense.current_allocated_funds + working_allocation[expense]))

        if vote.personal_abs_max:
            allowed_personal_allocation = min(allowed_personal_allocation, vote.personal_abs_max - working_user_allocation[user][expense])

        if vote.global_abs_max:
            allowed_global_allocation = min(allowed_global_allocation, vote.global_abs_max - working_allocation[expense])

        if vote.personal_pct_max:
            allowed_personal_allocation = min(allowed_personal_allocation, self.total_per_user * vote.personal_pct_max - working_user_allocation[user][expense])

        if vote.global_pct_max:
            allowed_global_allocation = min(allowed_global_allocation, self.total_amount * vote.global_pct_max - working_allocation[expense])

#        print ( "V: " + str(vote) + " G:" + str(allowed_global_allocation) + " P: " + str(allowed_personal_allocation) )
            
        return (allowed_global_allocation, allowed_personal_allocation)

    def get_top_open_expense(self, votes, expenses, working_allocation, working_user_allocation):
        votes = sorted(votes, key=(lambda v: v.rank), reverse=False)
        for idx in range(0, len(votes)):
            votes_with_same_rank = [votes[idx]]
            
            for idx2 in range(idx+1, len(votes)):
                if votes[idx2].rank == votes[idx].rank:
                    votes_with_same_rank.append(votes[idx2])
                else:
                    break

            open_expenses = []
            for vote in votes_with_same_rank:
                (global_allowed, personal_allowed) = self.get_allowed_additional_allocation(vote, expenses, working_allocation, working_user_allocation)
                if global_allowed > epsilon and personal_allowed > epsilon:
#                    print (str(vote) + " " + str(global_allowed) + " personal:" + str(personal_allowed))
                    open_expenses.append(vote.expense)

            if open_expenses:
                return open_expenses            

        return None

    #Allocate remaining funds without any constraints
    def unconstrained_allocation(self, user_votes, expenses, working_allocation, working_user_allocation):
        round_allocation = defaultdict(lambda: defaultdict(float))

        for user in user_votes.keys():
            top_expenses = self.get_top_open_expense(user_votes[user], expenses, working_allocation, working_user_allocation)
            
            if not top_expenses: #This user is done
#                print( user.username + " is done allocating, ending round.")
                del user_votes[user]
                return None

            #            print("Top expense for " + user.username + " is " + top_expense.name)
            total_weight = 0
            for vote in user_votes[user]:
                if vote.expense in top_expenses:
                    total_weight += vote.weight

            print("Total Weight for " + str(user) + " is :" + str(total_weight))
            
            for vote in user_votes[user]:
                if vote.expense in top_expenses:
                    if total_weight > 0:
                        round_allocation[user][vote.expense] += self.amount_remaining_per_user * (vote.weight / total_weight)
                    else:
                        round_allocation[user][vote.expense] += self.amount_remaining_per_user * len(top_expenses)

        return round_allocation

    def constrain_allocation(self, user_votes, expenses, working_allocation, working_user_allocation, round_allocation):
        violated_at_percent = 1

        round_sums = defaultdict(float)
        for user in round_allocation.keys():
            for expense in expenses:
                round_sums[expense] += round_allocation[user][expense]



#        pprint.pprint(round_sums)
 #       pprint.pprint(round_allocation)

        activeConstraint = ("noconstraint", "none", 0)
        
        for expense in expenses:
            for user in round_allocation.keys():
                vote = [vote for vote in user_votes[user] if vote.expense == expense]
                if vote:
                    vote = vote[0]
                else:
                    continue #user has no vote constraints on this expense
                
                (allowed_global_amount, allowed_personal_amount) = self.get_allowed_additional_allocation(vote, expenses, working_allocation, working_user_allocation)
            
                # At what percent of full funding are constraints on this expense violated?
                if round_allocation[user][expense] > epsilon:
                    global_pct = allowed_global_amount / round_sums[expense]
                    personal_pct = allowed_personal_amount / round_allocation[user][expense]
                    #import pdb; pdb.set_trace()
                    if(global_pct < violated_at_percent):
                        violated_at_percent = global_pct
                        activeConstraint = (vote,"global", global_pct)
                    if(personal_pct < violated_at_percent):
                        violated_at_percent = personal_pct
                        activeConstraint = (vote,"personal", personal_pct)

#        print( "Active Constraint: " + str(activeConstraint[0]) + " is " + activeConstraint[1] + " / " + str(activeConstraint[2]))
        return violated_at_percent

    def allocate_funds(self, allocation, requesting_user):
        expenses = allocation.allocationexpense_set.all()    
        votes = flatten([expense.allocationvote_set.all() for expense in expenses])

        user_votes = defaultdict(list)    
        for vote in votes:
            user_votes[vote.user].append(vote)

        voter_count = len(user_votes)

        if voter_count == 0:
            allocation.num_voters = 0
            for expense in expenses:
                expense.new_allocated_funds = 0
                expense.user_new_allocated_funds = 0                
            return expenses
        
        allocation.num_voters = voter_count
            
        amount_remaining = allocation.amount
        self.total_amount = amount_remaining
        
        self.total_per_user = self.total_amount/voter_count

        working_allocation = defaultdict(float)
        working_user_allocation = defaultdict(lambda: defaultdict(float))
    
        while amount_remaining > epsilon:
#            import pdb; pdb.set_trace()
            voter_count = len(user_votes)
            if voter_count == 0:
                break
            print ("\nNew Round: $" + str(amount_remaining))
        
            self.amount_remaining_per_user = amount_remaining/voter_count

            round_allocation = self.unconstrained_allocation(user_votes, expenses, working_allocation, working_user_allocation)

            #If someone dropped out then increase the share available to everyone who's left.
            if not round_allocation:
                if len(user_votes):
                    self.total_per_user = self.total_per_user + amount_remaining/len(user_votes)
                continue

            #Find at what percent of full funding we violate a constraint
            violated_at_percent = self.constrain_allocation(user_votes, expenses, working_allocation, working_user_allocation, round_allocation)
        
#            print ("Round funded at: " + str(violated_at_percent))
            
            #Add this round's funds to the working allocation
            made_alloc = False
            for user in user_votes.keys():
                for expense in expenses:
                    round_funds = round_allocation[user][expense] * violated_at_percent
                    working_allocation[expense] += round_funds
                    working_user_allocation[user][expense] += round_funds

                    if round_funds > 0:
                        print( user.get_full_name() + " allocated " + str(round_funds) + " to " + expense.name)
                        made_alloc = True
                    amount_remaining -= round_funds
#            pprint.pprint(working_allocation)
            if not made_alloc: break        
        #update the expense objects
        for expense in expenses:
            expense.new_allocated_funds = ceil(working_allocation[expense])
            expense.user_new_allocated_funds = ceil(working_user_allocation[requesting_user][expense])


            
        return expenses

def expense_to_json(expense):
    expense_json = {
        'name' : expense.name,
        'owner' : expense.owner.get_full_name(),
        'detail_text' : expense.detail_text,        
        'requested_funds' : expense.requested_funds,
        'current_allocated_funds' : expense.current_allocated_funds,
        'partial_allowed' : expense.partial_allowed,
        'excess_allowed' : expense.excess_allowed,
        'new_allocated_funds' : expense.new_allocated_funds,
        'user_new_allocated_funds' : expense.user_new_allocated_funds,
        'slug' : expense.slug
    }
    return expense_json

def allocation_to_json(allocation, expenses):
    allocation_json = {
        'amount' : allocation.amount,
        'num_voters' : allocation.num_voters,
        'expenses' : [expense_to_json(expense) for expense in expenses],
        'decision_date' : format(allocation.decision_date, settings.DATE_FORMAT),
        }
    
    return allocation_json
