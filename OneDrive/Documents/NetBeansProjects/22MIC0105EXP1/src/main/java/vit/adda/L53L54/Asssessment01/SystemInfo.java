package vit.adda.L53L54.Asssessment01;

import java.net.*;
import java.time.LocalDateTime;
import java.util.Enumeration;
/**
 *
 * @author 22MIC0105
 */
public class SystemInfo {
    public void printDetails(String regisNo) throws Exception {
        LocalDateTime currentDateTime = LocalDateTime.now();
        StringBuilder details = new StringBuilder();
        
        details.append("Registration Number: ").append(regisNo).append("\n");
        details.append("Current Date/Time: ").append(currentDateTime).append("\n");

        // Fetch MAC Address
        Enumeration<NetworkInterface> networkInterfaces = NetworkInterface.getNetworkInterfaces();
        if (networkInterfaces.hasMoreElements()) {
            NetworkInterface network = networkInterfaces.nextElement();
            byte[] mac = network.getHardwareAddress();
            if (mac != null) {
                details.append("MAC Address: ");
                for (int i = 0; i < mac.length; i++) {
                    details.append(String.format("%02X%s", mac[i], (i < mac.length - 1) ? "-" : ""));
                }
                details.append("\n");
            } else {
                details.append("MAC Address: Not available\n");
            }
        }

        System.out.println(details);
    }
}
