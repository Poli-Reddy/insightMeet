
package vit.adda.L53L54.Asssessment01;

/**
 *
 * @author 22MIC0105
 */
public class PoS extends Bank {
     private Boolean QR_avialble;
     private int Max_Purchase;
     public void swipe_card() {
        System.out.println("Card swiped in the PoS machine by 22MIC0105");
    }

    public void pin() {
        System.out.println("PIN verification initiated by 22MIC0105");
    }

    public void bill() {
        System.out.println("Bill generated and processed by 22MIC0105");
    }
}
