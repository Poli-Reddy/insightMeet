package vit.adda.L53L54.Asssessment01;

/**
 *
 * @author 22MIC0105
 */
public class BankOperation{

    public static void main(String[] args) {
        try {
            
            SystemInfo sinfo = new SystemInfo();
            sinfo.printDetails("21MIC0105");

            Bank bank = new Bank();
            bank.setCustomerID("21MIC0105"); 
            bank.setAccountNumber(91999494);

            // ATM functionalities
            ATM atm = new ATM();
            atm.withdraw();
            atm.deposit();

            // PoS functionalities
            PoS pos = new PoS();
            pos.swipe_card();
            pos.pin();
            pos.bill();

        } catch (Exception e) {
            e.printStackTrace();
        }
    
    }
}
