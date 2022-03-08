namespace minerGold.Models;

public class GridStakeHelp
{
    public GridStakeHelp(int amountStaked, string amountReward)
    {
        this.AmountStaked = amountStaked;
        this.AmountReward = amountReward;
    }

    public int AmountStaked { get; set; }
    public string AmountReward { get; set; }

    public bool DisableHarvest => AmountReward.Equals("0");
}