namespace minerGold.Models;

public class MinerNFT
{
    public MinerNFT()
    {
    }
    public MinerNFT(string name, string urlImg)
    {
        this.Name = name;
        this.UrlImg = urlImg;
    }

    public int Id { get; set; }
    public string Name { get; set; }
    public string Class { get; set; }
    public int Level { get; set; }
    public string UrlImg { get; set; }
    public bool Mining { get; set; }

    public bool DisableDeposit => this.Mining;
    public bool DisableWithdraw => this.Mining == false;
}