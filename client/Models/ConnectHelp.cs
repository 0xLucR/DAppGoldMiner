namespace minerGold.Models;
public class ConnectHelp
{
    public ConnectHelp()
    {
        this.AccountConnected = "";
        this.AccountFormated = "";
    }
    public string AccountConnected;

    public string AccountFormated;

    public bool Connected => this.AccountConnected != "" && this.AccountConnected != null;

    public void setAccountFormated()
    {
        if (this.AccountConnected != "")
        {
            var account = this.AccountConnected;
            var length = account.Length;
            var accountFormated = string.Format("{0}{1}{2}...{3}{4}{5}", account[0], account[1], account[2],
            account[length - 3], account[length - 2], account[length - 1]);

            this.AccountFormated = accountFormated;
        }
        else this.AccountFormated = this.AccountConnected;


    }


}